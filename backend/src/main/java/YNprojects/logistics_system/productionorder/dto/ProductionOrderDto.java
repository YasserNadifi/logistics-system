package YNprojects.logistics_system.productionorder.dto;

import YNprojects.logistics_system.productionorder.entity.ProductionOrderStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductionOrderDto {
    private Long id;

    private String reference;

    private LocalDate creationDate;

    private LocalDate startDate;

    private LocalDate plannedCompletionDate;

    @NotNull
    private ProductionOrderStatus status;

    private List<ProductionOrderMaterialDto> rawMaterials;

    private ProductionOrderProductDto product;
}



