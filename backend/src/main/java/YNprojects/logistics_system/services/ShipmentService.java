package YNprojects.logistics_system.services;

import YNprojects.logistics_system.DTO.ChangeStatusShipmentDto;
import YNprojects.logistics_system.DTO.CreateShipmentDto;
import YNprojects.logistics_system.DTO.ShipmentDto;
import YNprojects.logistics_system.entities.Shipment;
import YNprojects.logistics_system.entities.ShipmentStatus;
import YNprojects.logistics_system.exceptions.ResourceNotFoundException;
import YNprojects.logistics_system.mapper.ShipmentMapper;
import YNprojects.logistics_system.repositories.ProductRepo;
import YNprojects.logistics_system.repositories.ShipmentRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
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
    private final ProductRepo productRepo;
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

    public ShipmentDto createShipment(CreateShipmentDto createShipmentDto) {
        Shipment shipment = new Shipment();
        shipment.setReferenceCode(generateReferenceCode());
        shipment.setQuantity(createShipmentDto.getQuantity());
        shipment.setDepartureDate(createShipmentDto.getDepartureDate());
        shipment.setEstimateArrivalDate(createShipmentDto.getEstimateArrivalDate());

        shipment.setTransportMode(createShipmentDto.getTransportMode());
        shipment.setDestination(createShipmentDto.getDestination());
        shipment.setTrackingNumber(createShipmentDto.getTrackingNumber());
        shipment.setStatus(ShipmentStatus.PLANNED);
        shipment.setCreatedAt(LocalDateTime.now());
        shipment.setProduct(productRepo.findById(createShipmentDto.getProductId()).get());

        Shipment saved = shipmentRepo.save(shipment);
        return ShipmentMapper.toShipmentDto(saved);
    }

    public ShipmentDto changeStatus(ChangeStatusShipmentDto changeStatusShipmentDto) {
        Shipment shipment = shipmentRepo.findById(changeStatusShipmentDto.getId()).orElseThrow(
                ()->new ResourceNotFoundException("This shipment doesn't exist.")
        );
        ShipmentStatus newStatus = changeStatusShipmentDto.getStatus();
        shipment.setStatus(newStatus);
        if(newStatus == ShipmentStatus.DELIVERED) {
            shipment.setActualArrivalDate(LocalDate.now());
        } // add more logic for other status here
        Shipment saved = shipmentRepo.save(shipment);
        return ShipmentMapper.toShipmentDto(saved);
    }

}
