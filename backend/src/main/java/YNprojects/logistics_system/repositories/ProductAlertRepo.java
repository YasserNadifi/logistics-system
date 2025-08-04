package YNprojects.logistics_system.repositories;

import YNprojects.logistics_system.entities.AlertType;
import YNprojects.logistics_system.entities.Product;
import YNprojects.logistics_system.entities.ProductAlert;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductAlertRepo extends JpaRepository<ProductAlert, Long> {
    boolean existsByTypeAndProduct(AlertType type, Product product);

    void deleteByTypeAndProduct(AlertType type, Product product);
}
