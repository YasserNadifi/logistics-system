package YNprojects.logistics_system.repositories;

import YNprojects.logistics_system.entities.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepo extends JpaRepository<Alert, Long> {
}
