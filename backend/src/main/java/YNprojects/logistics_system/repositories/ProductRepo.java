package YNprojects.logistics_system.repositories;

import YNprojects.logistics_system.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepo extends JpaRepository<Product, Long> {
}
