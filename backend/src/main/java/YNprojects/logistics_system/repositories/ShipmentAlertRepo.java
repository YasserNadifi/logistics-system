package YNprojects.logistics_system.repositories;

import YNprojects.logistics_system.entities.AlertType;
import YNprojects.logistics_system.entities.Product;
import YNprojects.logistics_system.entities.Shipment;
import YNprojects.logistics_system.entities.ShipmentAlert;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShipmentAlertRepo extends JpaRepository<ShipmentAlert, Long> {
    boolean existsByTypeAndShipment(AlertType type, Shipment shipment);

    void deleteByTypeAndShipment(AlertType type, Shipment shipment);
}
