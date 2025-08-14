package YNprojects.logistics_system.scheduler;


import YNprojects.logistics_system.alert.entity.AlertType;
import YNprojects.logistics_system.alert.entity.EntityType;
import YNprojects.logistics_system.alert.repository.AlertRepo;
import YNprojects.logistics_system.productionorder.entity.ProductionOrder;
import YNprojects.logistics_system.productionorder.entity.ProductionOrderStatus;
import YNprojects.logistics_system.productionorder.repository.ProductionOrderRepo;
import YNprojects.logistics_system.productionorder.service.ProductionOrderService;
import YNprojects.logistics_system.shipment.dto.ChangeShipmentStatusDto;
import YNprojects.logistics_system.shipment.entity.Shipment;
import YNprojects.logistics_system.shipment.entity.ShipmentStatus;
import YNprojects.logistics_system.shipment.repo.ShipmentRepo;
import YNprojects.logistics_system.shipment.service.ShipmentService;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@Component
public class SystemScheduler {

    private final ShipmentRepo shipmentRepo;
    private final ShipmentService shipmentService;
    private final ProductionOrderRepo productionOrderRepo;
    private final ProductionOrderService productionOrderService;
    private final AlertRepo alertRepo;


    @Transactional
    @Scheduled(cron = "0 2 0 * * *")
    public void auto(){
        plannedToInProgressProductionOrder();
        inProgressToCompletedProductionOrder();

        inTransitToDelayedShipment();
        plannedToInTransitShipment();

        purgeOldCancelledShipmentAlerts();

        purgeOldCancelledProductionOrderAlerts();
        purgeOldReversedProductionOrderAlerts();

        purgeOldRawMaterialShortageAlertsForProductionOrders();
    }


    @Transactional
    public void plannedToInTransitShipment() {
        LocalDate today = LocalDate.now();
        List<Shipment> plannedShipments = shipmentRepo.findByStatusAndDepartureDate(ShipmentStatus.PLANNED, today);
        plannedShipments.forEach(shipment -> {
            ChangeShipmentStatusDto dto = new ChangeShipmentStatusDto(shipment.getId(), ShipmentStatus.IN_TRANSIT);
            shipmentService.changeShipmentStatus(dto);
        });
    }

    @Transactional
    public void inTransitToDelayedShipment() {
        LocalDate today = LocalDate.now();
        List<Shipment> overdue = shipmentRepo
                .findByStatusAndEstimateArrivalDate(ShipmentStatus.IN_TRANSIT, today);
        overdue.forEach(shipment -> {
            ChangeShipmentStatusDto dto = new ChangeShipmentStatusDto(shipment.getId(), ShipmentStatus.DELAYED);
            shipmentService.changeShipmentStatus(dto);
        });
    }

    @Transactional
    public void plannedToInProgressProductionOrder() {
        LocalDate today = LocalDate.now();
        List<ProductionOrder> plannedOrders = productionOrderRepo.findByStatusAndStartDate(ProductionOrderStatus.PLANNED,today);
        plannedOrders.forEach(productionOrder -> {
            try {
                productionOrderService.changeStatus(productionOrder.getId(),ProductionOrderStatus.IN_PROGRESS);
            } catch (Exception e) {
                productionOrderService.changeStatus(productionOrder.getId(),ProductionOrderStatus.CANCELLED);
            }
        });
    }

    @Transactional
    public void inProgressToCompletedProductionOrder() {
        LocalDate today = LocalDate.now();
        List<ProductionOrder> inProgressOrders = productionOrderRepo.findByStatusAndPlannedCompletionDate(ProductionOrderStatus.IN_PROGRESS,today);
        inProgressOrders.forEach(productionOrder -> {
            productionOrderService.changeStatus(productionOrder.getId(),ProductionOrderStatus.COMPLETED);
        });
    }

    @Transactional
    public void purgeOldCancelledShipmentAlerts() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(3);
        int deleted = alertRepo.deleteByAlertTypeAndCreatedAtBefore(AlertType.SHIPMENT_CANCELLED, cutoff);
    }

    @Transactional
    public void purgeOldCancelledProductionOrderAlerts() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(3);
        int deleted = alertRepo.deleteByAlertTypeAndCreatedAtBefore(AlertType.PRODUCTION_CANCELLED, cutoff);
    }

    @Transactional
    public void purgeOldReversedProductionOrderAlerts() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(3);
        int deleted = alertRepo.deleteByAlertTypeAndCreatedAtBefore(AlertType.PRODUCTION_REVERSED, cutoff);
    }

    @Transactional
    public void purgeOldRawMaterialShortageAlertsForProductionOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(3);
        int deleted = alertRepo.deleteByAlertTypeAndEntityTypeAndCreatedAtBefore(AlertType.PRODUCTION_REVERSED, EntityType.PRODUCTION_ORDER, cutoff);
    }
}
