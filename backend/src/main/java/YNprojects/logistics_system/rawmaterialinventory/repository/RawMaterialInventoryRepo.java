package YNprojects.logistics_system.rawmaterialinventory.repository;

import YNprojects.logistics_system.rawmaterial.entity.RawMaterial;
import YNprojects.logistics_system.rawmaterialinventory.entity.RawMaterialInventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RawMaterialInventoryRepo extends JpaRepository<RawMaterialInventory, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<RawMaterialInventory> findByRawMaterial(RawMaterial rawMaterial);

}
