package YNprojects.logistics_system.productionorder.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class ProductionOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reference; // e.g., PO-2025-001
    private LocalDate creationDate;
    private LocalDate startDate;
    private LocalDate plannedCompletionDate;

    @Enumerated(EnumType.STRING)
    private ProductionOrderStatus status; // PLANNED, IN_PROGRESS, COMPLETED, CANCELLED

    // Relations
    @OneToMany(mappedBy = "productionOrder", cascade = CascadeType.ALL)
    private List<ProductionOrderMaterial> rawMaterials; // Materials consumed

    @OneToOne(mappedBy = "productionOrder", cascade = CascadeType.ALL)
    private ProductionOrderProduct product; // Products produced
}

