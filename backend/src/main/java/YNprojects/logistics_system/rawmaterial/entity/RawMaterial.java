package YNprojects.logistics_system.rawmaterial.entity;

import YNprojects.logistics_system.rawmaterialinventory.entity.RawMaterialInventory;
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
public class RawMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String unit;

    @OneToOne(mappedBy = "product")
    private RawMaterialInventory rawMaterialInventory;

}
