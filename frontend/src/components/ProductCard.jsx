export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.title} loading="lazy" />
        <span className="badge">{product.category}</span>
      </div>
      <div className="product-body">
        <h4>{product.title}</h4>
        <p className="desc">{product.description}</p>
        <div className="product-meta">
          <span className="price">${product.price}</span>
          <span className="rating">* {product.rating}</span>
        </div>
      </div>
    </div>
  );
}
