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
public class ProductionOrderProductDto {
    private Long id; // optional for existing items
    @NotNull
    private Long productId; // only the id is required to map to Product
    private double quantity;
}