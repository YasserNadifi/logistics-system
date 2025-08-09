package YNprojects.logistics_system.productinventory.repository;

import YNprojects.logistics_system.product.entity.Product;
import YNprojects.logistics_system.productinventory.entities.ProductInventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface ProductInventoryRepo extends JpaRepository<ProductInventory, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ProductInventory> findByProduct(Product product);
}
