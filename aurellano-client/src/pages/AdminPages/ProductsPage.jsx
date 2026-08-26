import { useEffect, useMemo, useState } from "react";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import AdminModal from "../../components/Admin/AdminModal";
import AdminTablePagination from "../../components/Admin/AdminTablePagination";
import AdminTableSkeleton from "../../components/Admin/AdminTableSkeleton";
import AdminTableToolbar, {
  PRODUCT_SORT_OPTIONS,
  productSortToQuery,
} from "../../components/Admin/AdminTableToolbar";
import StockStatusChip from "../../components/Admin/StockStatusChip";
import Button from "../../components/Button";
import ProductImage from "../../components/ProductImage";
import { useAuth } from "../../context/AuthContext";
import { useAdminTableQuery } from "../../hooks/useAdminTableQuery";
import {
  createProductRequest,
  deleteProductRequest,
  getCategoriesRequest,
  getProductsRequest,
  getSupplierProductsRequest,
  getSuppliersRequest,
  updateProductRequest,
} from "../../services/api";
import { formatPeso, getId } from "../../utils/format";
import { deriveStockStatus } from "../../utils/stock";

const PAGE_SIZE = 10;

const emptyForm = {
  productName: "",
  productSlug: "",
  productDescription: "",
  productPrice: "",
  productImage: "",
  categoryId: "",
  supplierId: "",
  stockQuantity: "0",
};

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const inputClass =
  "mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none";

const AdminProductsPage = () => {
  const { token, user } = useAuth();
  const isSupplier = user?.userRole === "supplier";
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const { sort, page, setSort, setPage } = useAdminTableQuery(
    "az",
    PRODUCT_SORT_OPTIONS.map((option) => option.value)
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const query = {
        page,
        limit: PAGE_SIZE,
        sort: productSortToQuery(sort),
      };
      const [productResult, categoryList, supplierList] = await Promise.all([
        isSupplier
          ? getSupplierProductsRequest(query, token)
          : getProductsRequest(query),
        getCategoriesRequest(),
        isSupplier ? Promise.resolve([]) : getSuppliersRequest(),
      ]);
      setProducts(productResult.products);
      setTotalPages(productResult.totalPages ?? 1);
      setCategories(Array.isArray(categoryList) ? categoryList : categoryList?.data || []);
      setSuppliers(Array.isArray(supplierList) ? supplierList : supplierList?.data || []);
    } catch (err) {
      setError(err.message);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, sort, page, isSupplier, user?.supplierId]);

  useEffect(() => {
    if (loading || page <= totalPages) return;
    setPage(totalPages);
  }, [loading, page, totalPages, setPage]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      supplierId: isSupplier ? getId(user?.supplierId) : emptyForm.supplierId,
    });
    setModalOpen(true);
    setMessage("");
    setError("");
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      productName: product.productName || "",
      productSlug: product.productSlug || "",
      productDescription: product.productDescription || "",
      productPrice: String(product.productPrice ?? ""),
      productImage: product.productImage || "",
      categoryId: getId(product.categoryId),
      supplierId: getId(product.supplierId),
      stockQuantity: String(product.stockQuantity ?? 0),
    });
    setModalOpen(true);
    setMessage("");
    setError("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "productName" && !editing) {
        next.productSlug = slugify(value);
      }
      return next;
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const payload = {
      productName: form.productName.trim(),
      productSlug: form.productSlug.trim() || slugify(form.productName),
      productDescription: form.productDescription.trim(),
      productPrice: Number(form.productPrice),
      productImage: form.productImage.trim(),
      categoryId: form.categoryId,
      supplierId: form.supplierId,
      stockQuantity: Number(form.stockQuantity),
    };
    try {
      if (editing) {
        await updateProductRequest(editing._id, payload, token);
        setMessage("Product updated.");
      } else {
        await createProductRequest(payload, token);
        setMessage("Product created.");
      }
      closeModal();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (product) => {
    if (!window.confirm(`Delete "${product.productName}"?`)) return;
    setError("");
    setMessage("");
    try {
      await deleteProductRequest(product._id, token);
      setMessage("Product deleted.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const rows = useMemo(() => products, [products]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Catalog
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold text-primary">
            <Package className="h-7 w-7" strokeWidth={2} />
            Products
          </h1>
        </div>
        <Button type="button" variant="custom2" onClick={openCreate}>
          <span className="inline-flex items-center gap-2">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Create product
          </span>
        </Button>
      </div>

      {message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <AdminTableToolbar
        sort={sort}
        onSortChange={setSort}
        sortOptions={PRODUCT_SORT_OPTIONS}
      />

      <div className="mt-4 overflow-x-auto rounded-3xl bg-white shadow-sm">
        {loading ? (
          <AdminTableSkeleton columns={5} label="Loading products" />
        ) : !rows.length ? (
          <p className="p-6 text-sm text-zinc-600">No products yet.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-primary text-neutral1">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => (
                <tr key={product._id} className="border-b border-zinc-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 overflow-hidden rounded-lg bg-zinc-200">
                        <ProductImage
                          src={product.productImage}
                          alt={product.productName}
                          className="aspect-square w-10 object-cover"
                          iconClassName="h-4 w-4"
                        />
                      </div>
                      <span className="font-medium text-primary">{product.productName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {product.categoryId?.categoryName || "—"}
                  </td>
                  <td className="px-4 py-3">{formatPeso(product.productPrice)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="font-medium text-zinc-700">{product.stockQuantity}</span>
                      <StockStatusChip status={product.stockStatus} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="custom5" onClick={() => openEdit(product)}>
                        <span className="inline-flex items-center gap-1">
                          <Pencil className="h-3 w-3" />
                          Edit
                        </span>
                      </Button>
                      <Button type="button" variant="danger" onClick={() => onDelete(product)}>
                        <span className="inline-flex items-center gap-1">
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading ? (
          <AdminTablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            label="Products pagination"
          />
        ) : null}
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit product" : "Create product"}
        onClose={closeModal}
        wide
      >
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            Name
            <input name="productName" value={form.productName} onChange={onChange} required className={inputClass} />
          </label>
          <label className="text-sm">
            Slug
            <input name="productSlug" value={form.productSlug} onChange={onChange} required className={inputClass} />
          </label>
          <label className="text-sm">
            Price
            <input
              name="productPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.productPrice}
              onChange={onChange}
              required
              className={inputClass}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            Description
            <textarea
              name="productDescription"
              value={form.productDescription}
              onChange={onChange}
              required
              className={`${inputClass} min-h-24`}
            />
          </label>
          <div className="text-sm sm:col-span-2">
            <span>Image URL <span className="text-zinc-500">(optional)</span></span>
            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start">
              <input
                name="productImage"
                value={form.productImage}
                onChange={onChange}
                className={`${inputClass} mt-0 sm:flex-1`}
                placeholder="https://..."
              />
              <div className="shrink-0 overflow-hidden rounded-xl bg-zinc-200">
                <ProductImage
                  key={form.productImage.trim()}
                  src={form.productImage.trim()}
                  alt={form.productName || "Product preview"}
                  className="aspect-square w-[7.5rem] object-cover"
                  iconClassName="h-8 w-8"
                />
              </div>
            </div>
          </div>
          <label className="text-sm">
            Category
            <select name="categoryId" value={form.categoryId} onChange={onChange} required className={inputClass}>
              <option value="">Select category</option>
              {categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.categoryName}
                </option>
              ))}
            </select>
          </label>
          {!isSupplier ? (
            <label className="text-sm">
              Supplier
              <select
                name="supplierId"
                value={form.supplierId}
                onChange={onChange}
                required
                className={inputClass}
              >
                <option value="">Select supplier</option>
                {suppliers.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.supplierName}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="text-sm">
            Stock quantity
            <input
              name="stockQuantity"
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={onChange}
              required
              className={inputClass}
            />
          </label>
          <div className="text-sm">
            <span>Stock status</span>
            <div className="mt-2">
              <StockStatusChip status={deriveStockStatus(form.stockQuantity)} />
            </div>
            <p className="mt-1 text-xs text-zinc-500">Auto-calculated when saved.</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="submit" variant="custom2" disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Create"}
            </Button>
            <Button type="button" variant="custom5" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminProductsPage;
