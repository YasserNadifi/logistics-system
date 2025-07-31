package YNprojects.logistics_system.repositories;

import YNprojects.logistics_system.entities.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;


public interface InventoryRepo extends JpaRepository<Inventory, Long> {
}
