package YNprojects.logistics_system.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public abstract class Alert {

    @Enumerated(EnumType.STRING)
    private AlertType type;
    private String message;
    private LocalDateTime createdAt;

}
