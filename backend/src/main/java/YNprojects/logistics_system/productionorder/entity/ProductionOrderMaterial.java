package YNprojects.logistics_system.productionorder.entity;

import YNprojects.logistics_system.rawmaterial.entity.RawMaterial;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class ProductionOrderMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private RawMaterial rawMaterial;
    private double quantity;

    @ManyToOne
    private ProductionOrder productionOrder;
}
