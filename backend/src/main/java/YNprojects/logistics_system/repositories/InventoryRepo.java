package YNprojects.logistics_system.repositories;

import YNprojects.logistics_system.entities.Inventory;
import YNprojects.logistics_system.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;


public interface InventoryRepo extends JpaRepository<Inventory, Long> {
    Inventory findByProduct(Product product);
}
