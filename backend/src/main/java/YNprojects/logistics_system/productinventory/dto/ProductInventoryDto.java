package YNprojects.logistics_system.productinventory.dto;

import YNprojects.logistics_system.product.dto.ProductDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProductInventoryDto {
    private Long id;
    private Double quantity;
    private Double reorderThreshold;
    private LocalDateTime lastUpdated;
    private ProductDto productDto;
}
