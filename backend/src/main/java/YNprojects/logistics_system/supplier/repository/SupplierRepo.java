package YNprojects.logistics_system.supplier.repository;

import YNprojects.logistics_system.supplier.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepo extends JpaRepository<Supplier, Long> {
}
