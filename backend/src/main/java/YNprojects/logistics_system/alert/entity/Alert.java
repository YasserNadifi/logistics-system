package YNprojects.logistics_system.alert.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private AlertType alertType;

    @Enumerated(EnumType.STRING)
    private AlertSeverity severity;

    @Enumerated(EnumType.STRING)
    private EntityType entityType;
    private Long entityId;

    private String message;
}
