package YNprojects.logistics_system.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
public abstract class Alert {

    @Enumerated(EnumType.STRING)
    protected AlertType type;
    protected String message;
    protected LocalDateTime createdAt;

}
