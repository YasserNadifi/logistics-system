package YNprojects.logistics_system.rawmaterialinventory.dto;

import YNprojects.logistics_system.rawmaterial.dto.RawMaterialDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RawMaterialInventoryDto {
    private Long id;
    private Double quantity;
    private Double reorderThreshold;
    private LocalDateTime lastUpdated;
    private RawMaterialDto rawMaterialDto;
}
