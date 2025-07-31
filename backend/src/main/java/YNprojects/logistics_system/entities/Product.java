package YNprojects.logistics_system.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String unit;
    private String sku;

    @OneToMany(mappedBy = "product")
    private List<Shipment> shipments;

    @OneToOne(mappedBy = "product")
    private Inventory inventory;

    @OneToMany(mappedBy = "product")
    private List<Alert> alerts;

}
