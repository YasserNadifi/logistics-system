package YNprojects.logistics_system.rawmaterial.repository;

import YNprojects.logistics_system.rawmaterial.entity.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RawMaterialRepo extends JpaRepository<RawMaterial, Long> {
}
