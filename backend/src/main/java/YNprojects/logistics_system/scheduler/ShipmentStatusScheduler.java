package YNprojects.logistics_system.scheduler;


import YNprojects.logistics_system.DTO.ChangeStatusShipmentDto;
import YNprojects.logistics_system.entities.Shipment;
import YNprojects.logistics_system.entities.ShipmentStatus;
import YNprojects.logistics_system.repositories.ShipmentRepo;
import YNprojects.logistics_system.services.ShipmentService;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor
@Component
public class ShipmentStatusScheduler {

    private final ShipmentRepo shipmentRepo;
    private final ShipmentService shipmentService;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void autoDelayOverdueShipments() {
        LocalDate today = LocalDate.now();
        List<Shipment> overdue = shipmentRepo
                .findByStatusAndEstimateArrivalDateBefore(ShipmentStatus.IN_TRANSIT, today);
        overdue.forEach(shipment -> {
            ChangeStatusShipmentDto dto = new ChangeStatusShipmentDto(shipment.getId(),
                    ShipmentStatus.DELAYED, null);
            shipmentService.changeStatus(dto);
        });
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void autoTransitPlannedShipments() {
        LocalDate today = LocalDate.now();
        List<Shipment> planned = shipmentRepo.findByStatusAndDepartureDateBefore(ShipmentStatus.PLANNED, today);
        planned.forEach(shipment -> {
            ChangeStatusShipmentDto dto = new ChangeStatusShipmentDto(shipment.getId(),
                    ShipmentStatus.IN_TRANSIT, null);
            shipmentService.changeStatus(dto);
        });
    }

}
