package YNprojects.logistics_system.entities;

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

    private AlertType type;
    private String message;
    private LocalDateTime createdAt;

    @ManyToOne
    private Shipment shipment;

    @ManyToOne
    private Product product;

}
