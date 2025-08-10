package YNprojects.logistics_system.shipment.repo;

import YNprojects.logistics_system.shipment.entity.Shipment;
import YNprojects.logistics_system.shipment.entity.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ShipmentRepo extends JpaRepository<Shipment, Long> {
    List<Shipment> findByStatusAndDepartureDate(ShipmentStatus status, LocalDate departureDate);

    List<Shipment> findByStatusAndEstimateArrivalDate(ShipmentStatus status, LocalDate estimateArrivalDate);
}
