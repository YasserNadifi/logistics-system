package YNprojects.logistics_system.DTO;

import YNprojects.logistics_system.entities.AlertType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AlertDto {
    private Long id;
    protected AlertType type;
    protected String message;
    protected LocalDateTime createdAt;
    private Long    productId;    // nullable
    private Long    shipmentId;
}
