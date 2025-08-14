package YNprojects.logistics_system.rawmaterialinventory.entity;

import YNprojects.logistics_system.productinventory.entities.Inventory;
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
public class RawMaterialInventory extends Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    private RawMaterial rawMaterial;

}
