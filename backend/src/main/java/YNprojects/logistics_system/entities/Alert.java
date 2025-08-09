package YNprojects.logistics_system.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private AlertType type;
    private String message;
    private LocalDateTime createdAt;

    private AlertSourceType sourceType;
    private Long sourceId;

}
