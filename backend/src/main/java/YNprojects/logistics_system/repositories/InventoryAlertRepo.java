package YNprojects.logistics_system.repositories;

import YNprojects.logistics_system.entities.AlertType;
import YNprojects.logistics_system.entities.Inventory;
import YNprojects.logistics_system.entities.InventoryAlert;
import YNprojects.logistics_system.entities.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryAlertRepo extends JpaRepository<InventoryAlert, Long> {

    boolean existsByTypeAndInventory(AlertType type, Inventory inventory);

    void deleteByTypeAndInventory(AlertType type, Inventory inventory);

}
