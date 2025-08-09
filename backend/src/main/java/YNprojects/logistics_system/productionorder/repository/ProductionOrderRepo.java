package YNprojects.logistics_system.productionorder.repository;

import YNprojects.logistics_system.productionorder.entity.ProductionOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

public interface ProductionOrderRepo extends JpaRepository<ProductionOrder, Long> {
}
