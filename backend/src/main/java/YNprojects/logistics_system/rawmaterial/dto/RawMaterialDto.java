package YNprojects.logistics_system.rawmaterial.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RawMaterialDto {
    private Long id;
    private String name;
    private String description;
    private String unit;
    private String sku;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
