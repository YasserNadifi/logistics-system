package YNprojects.logistics_system.supplier.service;

import YNprojects.logistics_system.exceptions.ResourceNotFoundException;
import YNprojects.logistics_system.supplier.dto.SupplierDto;
import YNprojects.logistics_system.supplier.entity.Supplier;
import YNprojects.logistics_system.supplier.mapper.SupplierMapper;
import YNprojects.logistics_system.supplier.repository.SupplierRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class SupplierService {

    private final SupplierRepo supplierRepo;

    @Transactional(readOnly = true)
    public List<SupplierDto> getAll() {
        return supplierRepo.findAll().stream()
                .map(SupplierMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierDto findById(Long id) {
        Supplier s = supplierRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found. Id: " + id));
        return SupplierMapper.toDto(s);
    }

    @Transactional
    public SupplierDto create(SupplierDto dto) {
        if (dto == null) throw new IllegalArgumentException("SupplierDto cannot be null");
        if (dto.getSupplierName() == null || dto.getSupplierName().isBlank())
            throw new IllegalArgumentException("Supplier name is required");

        Supplier entity = SupplierMapper.toEntity(dto);
        entity.setId(null);
        Supplier saved = supplierRepo.save(entity);
        return SupplierMapper.toDto(saved);
    }

    @Transactional
    public SupplierDto update(SupplierDto dto) {
        if (dto == null) throw new IllegalArgumentException("SupplierDto cannot be null");
        Supplier existing = supplierRepo.findById(dto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found. Id: " + dto.getId()));

        if (dto.getSupplierName() != null) existing.setSupplierName(dto.getSupplierName());
        if (dto.getContactInfo() != null) existing.setContactInfo(dto.getContactInfo());

        Supplier saved = supplierRepo.save(existing);
        return SupplierMapper.toDto(saved);
    }

}
