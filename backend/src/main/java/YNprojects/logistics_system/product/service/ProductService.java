package YNprojects.logistics_system.product.service;

import YNprojects.logistics_system.product.dto.CreateProductDto;
import YNprojects.logistics_system.product.dto.ProductDto;
import YNprojects.logistics_system.product.entity.Product;
import YNprojects.logistics_system.exceptions.ResourceNotFoundException;
import YNprojects.logistics_system.product.mapper.ProductMapper;
import YNprojects.logistics_system.product.repository.ProductRepo;
import YNprojects.logistics_system.productinventory.service.ProductInventoryService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class ProductService {

    private final ProductRepo productRepo;
    private final ProductInventoryService productInventoryService;

    public List<ProductDto> getAllProducts() {
        return productRepo.findAll().stream().map(ProductMapper::toProductDto).toList();
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepo.findById(id).orElseThrow(
                ()->new ResourceNotFoundException("This product doesn't exist.")
        );
        return ProductMapper.toProductDto(product);
    }

    public ProductDto createProduct(CreateProductDto createProductDto) {
        Product product = new Product();
        product.setName(createProductDto.getName());
        product.setDescription(createProductDto.getDescription());
        product.setUnit(createProductDto.getUnit());
        product.setSku(createProductDto.getSku());
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        product.setProductionDurationMinutes(createProductDto.getProductionDurationMinutes());
        product = productRepo.save(product);
        productInventoryService.createProductInventory(product);
        return ProductMapper.toProductDto(product);
    }

    public ProductDto updateProduct(ProductDto productDto) {
        Product product = productRepo.findById(productDto.getId()).orElseThrow(
                ()->new ResourceNotFoundException("This product doesn't exist.")
        );
        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());
        product.setUnit(productDto.getUnit());
        product.setSku(productDto.getSku());
        product.setUpdatedAt(LocalDateTime.now());
        product.setProductionDurationMinutes(productDto.getProductionDurationMinutes());
        Product updated = productRepo.save(product);
        return ProductMapper.toProductDto(updated);
    }

}
