package YNprojects.logistics_system.product.repository;

import YNprojects.logistics_system.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepo extends JpaRepository<Product, Long> {
}
