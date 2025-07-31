package YNprojects.logistics_system.repositories;

import YNprojects.logistics_system.entities.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShipmentRepo extends JpaRepository<Shipment, Long> {
}
