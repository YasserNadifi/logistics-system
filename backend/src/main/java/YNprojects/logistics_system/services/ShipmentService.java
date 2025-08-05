package YNprojects.logistics_system.services;

import YNprojects.logistics_system.DTO.ChangeStatusShipmentDto;
import YNprojects.logistics_system.DTO.CreateShipmentDto;
import YNprojects.logistics_system.DTO.ShipmentDto;
import YNprojects.logistics_system.entities.*;
import YNprojects.logistics_system.exceptions.ResourceNotFoundException;
import YNprojects.logistics_system.mapper.ShipmentMapper;
import YNprojects.logistics_system.repositories.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ShipmentService {

    private final ShipmentRepo shipmentRepo;
    private final InventoryRepo inventoryRepo;
    private final ProductRepo productRepo;
    private final AlertService alertService;
    private final ProductAlertRepo productAlertRepo;
    private final ShipmentAlertRepo shipmentAlertRepo;

    private static int dailyCounter = 0;
    private static LocalDate lastResetDate = LocalDate.now();



    public List<ShipmentDto> getAllShipment() {
        return shipmentRepo.findAll().stream().map(ShipmentMapper::toShipmentDto).collect(Collectors.toList());
    }

    public ShipmentDto getShipmentById(Long id) {
        Shipment shipment = shipmentRepo.findById(id).orElseThrow(
                ()->new ResourceNotFoundException("This shipment doesn't exist.")
        );
        return ShipmentMapper.toShipmentDto(shipment);
    }

    public String generateReferenceCode() {
        LocalDate today = LocalDate.now();
        if (!today.equals(lastResetDate)) {
            dailyCounter = 0;
            lastResetDate = today;
        }
        dailyCounter++;
        String sequence = String.format("%03d", dailyCounter);
        return "SHIP-" + today.format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + sequence;
    }

    @Transactional
    public ShipmentDto createShipment(CreateShipmentDto createShipmentDto) {
        Shipment shipment = new Shipment();
        Product shippedProduct=productRepo.findById(createShipmentDto.getProductId()).get();

        LocalDate dep = createShipmentDto.getDepartureDate();
        LocalDate eta = createShipmentDto.getEstimateArrivalDate();
        if (dep.isAfter(eta)) {
            throw new RuntimeException(
                    "Departure date (" + dep + ") must be on or before estimated arrival (" + eta + ")"
            );//use custom exception here
        }

        LocalDate today = LocalDate.now();
        ShipmentStatus status;
        if (dep.isAfter(today)) {
            status = ShipmentStatus.PLANNED;
        } else if (( !dep.isAfter(today) ) && ( !eta.isBefore(today) )) {
            status = ShipmentStatus.IN_TRANSIT;
        } else {
            status = ShipmentStatus.DELAYED;
        }

        shipment.setReferenceCode(generateReferenceCode());
        shipment.setQuantity(createShipmentDto.getQuantity());
        shipment.setDepartureDate(createShipmentDto.getDepartureDate());
        shipment.setEstimateArrivalDate(createShipmentDto.getEstimateArrivalDate());
        shipment.setTransportMode(createShipmentDto.getTransportMode());
        shipment.setDestination(createShipmentDto.getDestination());
        shipment.setTrackingNumber(createShipmentDto.getTrackingNumber());
        shipment.setStatus(status);
        shipment.setCreatedAt(LocalDateTime.now());
        shipment.setProduct(shippedProduct);

        Inventory inventory = inventoryRepo.findByProduct(shippedProduct);
        if(inventory==null) {throw new RuntimeException("lol what");}
        if(inventory.getQuantity() < shipment.getQuantity()) {
            throw new RuntimeException("not enough quantity");//use custom exception here
        }
        inventory.setQuantity(inventory.getQuantity() - shipment.getQuantity());

        if(inventory.getQuantity() <= inventory.getReorderThreshold()) {
            alertService.createProductAlert(shippedProduct, AlertType.LOW_STOCK);
        } else {
            productAlertRepo.deleteByTypeAndProduct(AlertType.LOW_STOCK, shippedProduct);
        }

        Shipment saved = shipmentRepo.save(shipment);

        if(saved.getStatus() == ShipmentStatus.DELAYED) {
            alertService.createShipmentAlert(shipment, AlertType.SHIPMENT_DELAYED);
        }

        return ShipmentMapper.toShipmentDto(saved);
    }

    public static boolean isValidShipmentTransition(ShipmentStatus current, ShipmentStatus next) {
        return switch (current) {
            case PLANNED -> next == ShipmentStatus.IN_TRANSIT || next == ShipmentStatus.CANCELLED/* || next == ShipmentStatus.DELAYED*/;
            case IN_TRANSIT -> next == ShipmentStatus.DELIVERED || next == ShipmentStatus.DELAYED || next == ShipmentStatus.CANCELLED;
            case DELAYED -> next == ShipmentStatus.IN_TRANSIT || next == ShipmentStatus.CANCELLED || next == ShipmentStatus.DELIVERED;
            default -> false;
        };
    }


    @Transactional
    public ShipmentDto changeStatus(ChangeStatusShipmentDto changeStatusShipmentDto) {
        Shipment shipment = shipmentRepo.findById(changeStatusShipmentDto.getId()).orElseThrow(
                ()->new ResourceNotFoundException("This shipment doesn't exist.")
        );
        ShipmentStatus currentStatus = shipment.getStatus();
        ShipmentStatus newStatus = changeStatusShipmentDto.getStatus();

        if(isValidShipmentTransition(currentStatus, newStatus)) {
            shipment.setStatus(newStatus);
            if(newStatus == ShipmentStatus.DELIVERED) {
                shipment.setActualArrivalDate(LocalDate.now());
            } else if (newStatus == ShipmentStatus.DELAYED){
                alertService.createShipmentAlert(shipment, AlertType.SHIPMENT_DELAYED);
            } else if(currentStatus == ShipmentStatus.DELAYED) {
                shipmentAlertRepo.deleteByTypeAndShipment(AlertType.SHIPMENT_DELAYED, shipment);
                if(newStatus == ShipmentStatus.IN_TRANSIT) {
                    shipment.setEstimateArrivalDate(changeStatusShipmentDto.getNewEstimateArrivalDate());
                }
            }
        } else {
            throw new RuntimeException("not valid shipment transition");//add custom exception
        }
        Shipment saved = shipmentRepo.save(shipment);
        return ShipmentMapper.toShipmentDto(saved);
    }

}
