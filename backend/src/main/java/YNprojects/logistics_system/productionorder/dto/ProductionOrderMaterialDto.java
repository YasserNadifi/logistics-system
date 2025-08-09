package YNprojects.logistics_system.productionorder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.antlr.v4.runtime.misc.NotNull;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProductionOrderMaterialDto {
    private Long id; // DTO id for the relation (optional for existing items)
    @NotNull
    private Long rawMaterialId; // only the id is required for mapping
    private double quantity;
}
