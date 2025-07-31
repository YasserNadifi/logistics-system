package YNprojects.logistics_system.mapper;

import YNprojects.logistics_system.DTO.ProductDto;
import YNprojects.logistics_system.entities.Product;

public class ProductMapper {

    public static ProductDto toProductDto(Product product) {
        ProductDto productDto = new ProductDto();
        productDto.setId(product.getId());
        productDto.setName(product.getName());
        productDto.setDescription(product.getDescription());
        productDto.setCreatedAt(product.getCreatedAt());
        productDto.setUpdatedAt(product.getUpdatedAt());
        productDto.setUnit(product.getUnit());
        productDto.setSku(product.getSku());
        return productDto;
    }

    public static Product toProduct(ProductDto productDto) {
        Product product = new Product();
        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());
        product.setCreatedAt(productDto.getCreatedAt());
        product.setUpdatedAt(productDto.getUpdatedAt());
        product.setUnit(productDto.getUnit());
        product.setSku(productDto.getSku());
        return product;
    }

}
