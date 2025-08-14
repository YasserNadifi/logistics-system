package YNprojects.logistics_system.productinventory.entities;

import jakarta.persistence.MappedSuperclass;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
public abstract class Inventory {
    protected Double quantity;
    protected Double reorderThreshold;
    protected LocalDateTime lastUpdated;
}
