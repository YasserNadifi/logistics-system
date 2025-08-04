package YNprojects.logistics_system.repositories;

import YNprojects.logistics_system.entities.Shipment;
import YNprojects.logistics_system.entities.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ShipmentRepo extends JpaRepository<Shipment, Long> {
    List<Shipment> findByStatusAndEstimateArrivalDateBefore(ShipmentStatus status, LocalDate estimateArrivalDateBefore);

    List<Shipment> findByStatusAndDepartureDateBefore(ShipmentStatus status, LocalDate departureDateBefore);
}
