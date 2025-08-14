package YNprojects.logistics_system.alert.repository;

import YNprojects.logistics_system.alert.entity.Alert;
import YNprojects.logistics_system.alert.entity.AlertType;
import YNprojects.logistics_system.alert.entity.EntityType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AlertRepo extends JpaRepository<Alert, Long> {

    Optional<Alert> findFirstByAlertTypeAndEntityTypeAndEntityId(AlertType type, EntityType entityType, Long entityId);

    List<Alert> findByEntityTypeAndEntityId(EntityType entityType, Long entityId);

    List<Alert> findByAlertType(AlertType alertType);

    int deleteByAlertTypeAndCreatedAtBefore(AlertType alertType, LocalDateTime createdAtBefore);

    int deleteByAlertTypeAndEntityTypeAndCreatedAtBefore(AlertType alertType, EntityType entityType, LocalDateTime createdAtBefore);
}
