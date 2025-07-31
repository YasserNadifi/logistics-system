package YNprojects.logistics_system.DTO;

import YNprojects.logistics_system.entities.Product;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class InventoryDto {
    private Long id;
    private Double quantity;
    private Double reorderThreshold;
    private LocalDateTime lastUpdated;
    private ProductDto productDto;
}
