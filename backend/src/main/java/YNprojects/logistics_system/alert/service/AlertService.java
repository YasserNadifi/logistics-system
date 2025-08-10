package YNprojects.logistics_system.alert.service;

import YNprojects.logistics_system.alert.entity.Alert;
import YNprojects.logistics_system.alert.entity.AlertSeverity;
import YNprojects.logistics_system.alert.entity.AlertType;
import YNprojects.logistics_system.alert.entity.EntityType;
import YNprojects.logistics_system.alert.repository.AlertRepo;
import YNprojects.logistics_system.exceptions.ResourceNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class AlertService {

    private final AlertRepo alertRepo;

    @Transactional
    public Alert createIfNotExists(AlertType type, AlertSeverity severity, EntityType entityType, Long entityId) {
        return alertRepo.findFirstByAlertTypeAndEntityTypeAndEntityId(type, entityType, entityId)
                .orElseGet(() -> {
                    Alert alert = new Alert();
                    alert.setAlertType(type);
                    alert.setSeverity(severity);
                    alert.setEntityType(entityType);
                    alert.setEntityId(entityId);
                    alert.setCreatedAt(LocalDateTime.now());
                    return alertRepo.save(alert);
                });
    }

    @Transactional(readOnly = true)
    public List<Alert> getAll() {
        return alertRepo.findAll();
    }

    @Transactional(readOnly = true)
    public Alert getById(Long id) {
        return alertRepo.findById(id).orElseThrow(
                ()->new ResourceNotFoundException("Alert with id " + id + " not found")
        );
    }

    @Transactional(readOnly = true)
    public List<Alert> findByEntity(EntityType entityType, Long entityId) {
        return alertRepo.findByEntityTypeAndEntityId(entityType, entityId);
    }

    @Transactional(readOnly = true)
    public List<Alert> findByAlertType(AlertType type) {
        return alertRepo.findByAlertType(type);
    }

    @Transactional
    public boolean resolve(Long alertId) {
        if (!alertRepo.existsById(alertId)) return false;
        alertRepo.deleteById(alertId);
        return true;
    }

    @Transactional
    public int resolveByTypeAndEntity(AlertType type, EntityType entityType, Long entityId) {
        return alertRepo.findFirstByAlertTypeAndEntityTypeAndEntityId(type, entityType, entityId)
                .map(a -> { alertRepo.delete(a); return 1; })
                .orElse(0);
    }
}
