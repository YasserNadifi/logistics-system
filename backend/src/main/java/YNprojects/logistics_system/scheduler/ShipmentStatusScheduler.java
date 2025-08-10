package YNprojects.logistics_system.scheduler;


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
import java.util.List;

@AllArgsConstructor
@Component
public class ShipmentStatusScheduler {

    private final ShipmentRepo shipmentRepo;
    private final ShipmentService shipmentService;
    private final ProductionOrderRepo productionOrderRepo;
    private final ProductionOrderService productionOrderService;

    @Transactional
    @Scheduled(cron = "0 0 0 * * *")
    public void auto(){
        plannedToInProgressProductionOrder();
        inProgressToCompletedProductionOrder();

        inTransitToDelayedShipment();
        plannedToInTransitShipment();
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

}
