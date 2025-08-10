package YNprojects.logistics_system.productionorder.repository;

import YNprojects.logistics_system.productionorder.entity.ProductionOrder;
import YNprojects.logistics_system.productionorder.entity.ProductionOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

public interface ProductionOrderRepo extends JpaRepository<ProductionOrder, Long> {
    List<ProductionOrder> findByStatusAndStartDateBefore(ProductionOrderStatus status, LocalDate startDateBefore);

    List<ProductionOrder> findByStatusAndStartDate(ProductionOrderStatus status, LocalDate startDate);

    List<ProductionOrder> findByStatusAndPlannedCompletionDate(ProductionOrderStatus status, LocalDate plannedCompletionDate);
}
