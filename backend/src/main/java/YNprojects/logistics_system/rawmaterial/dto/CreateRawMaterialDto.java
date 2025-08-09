package YNprojects.logistics_system.rawmaterial.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateRawMaterialDto {
    private String name;
    private String description;
    private String unit;
}
