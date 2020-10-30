import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Button,
  Card,
  Checkbox,
  InputAdornment,
  FormControlLabel,
  IconButton,
  Link,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  makeStyles,
} from '@material-ui/core';
import {
  Image as ImageIcon,
  Edit as EditIcon,
  ArrowRight as ArrowRightIcon,
  Search as SearchIcon,
} from 'react-feather';
import Label from 'src/components/Label';

const categoryOptions = [
  {
    id: 'all',
    name: 'All',
  },
  {
    id: 'dress',
    name: 'Dress',
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
  },
  {
    id: 'blouse',
    name: 'Blouse',
  },
  {
    id: 'beauty',
    name: 'Beauty',
  },
];

const avalabilityOptions = [
  {
    id: 'all',
    name: 'All',
  },
  {
    id: 'available',
    name: 'Available',
  },
  {
    id: 'unavailable',
    name: 'Unavailable',
  },
];

const sortOptions = [
  {
    value: 'updatedAt|desc',
    label: 'Last update (newest first)',
  },
  {
    value: 'updatedAt|asc',
    label: 'Last update (oldest first)',
  },
  {
    value: 'createdAt|desc',
    label: 'Creation date (newest first)',
  },
  {
    value: 'createdAt|asc',
    label: 'Creation date (oldest first)',
  },
];

const getInventoryLabel = (inventoryType) => {
  const map = {
    in_stock: {
      text: 'In Stock',
      color: 'success',
    },
    limited: {
      text: 'Limited',
      color: 'warning',
    },
    out_of_stock: {
      text: 'Out of Stock',
      color: 'error',
    },
  };

  const { text, color } = map[inventoryType];

  return (
    <Label color={color}>
      {text}
    </Label>
  );
};

const applyFilters = (products, query, filters) => {
  return products.filter((product) => {
    let matches = true;

    if (query && !product.name.toLowerCase().includes(query.toLowerCase())) {
      matches = false;
    }

    if (filters.category && product.category !== filters.category) {
      matches = false;
    }

    if (filters.availability) {
      if (filters.availability === 'available' && !product.isAvailable) {
        matches = false;
      }

      if (filters.availability === 'unavailable' && product.isAvailable) {
        matches = false;
      }
    }

    if (filters.inStock && !['in_stock', 'limited'].includes(product.inventoryType)) {
      matches = false;
    }

    if (filters.isShippable && !product.isShippable) {
      matches = false;
    }

    return matches;
  });
};

const applyPagination = (products, page, limit) => {
  return products.slice(page * limit, page * limit + limit);
};

const useStyles = makeStyles((theme) => ({
  root: {},
  bulkOperations: {
    position: 'relative',
  },
  bulkActions: {
    paddingLeft: 4,
    paddingRight: 4,
    marginTop: 6,
    position: 'absolute',
    width: '100%',
    zIndex: 2,
    backgroundColor: theme.palette.background.default,
  },
  bulkAction: {
    marginLeft: theme.spacing(2),
  },
  queryField: {
    width: 500,
  },
  categoryField: {
    flexBasis: 200,
  },
  availabilityField: {
    marginLeft: theme.spacing(2),
    flexBasis: 200,
  },
  stockField: {
    marginLeft: theme.spacing(2),
  },
  shippableField: {
    marginLeft: theme.spacing(2),
  },
  imageCell: {
    fontSize: 0,
    width: 68,
    flexBasis: 68,
    flexGrow: 0,
    flexShrink: 0,
  },
  image: {
    height: 68,
    width: 68,
  },
}));

const Results = ({ className, products, ...rest }) => {
  const classes = useStyles();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(sortOptions[0].value);
  const [filters, setFilters] = useState({
    category: null,
    availability: null,
    inStock: null,
    isShippable: null,
  });

  const handleQueryChange = (event) => {
    event.persist();
    setQuery(event.target.value);
  };

  const handleCategoryChange = (event) => {
    event.persist();

    let value = null;

    if (event.target.value !== 'all') {
      value = event.target.value;
    }

    setFilters((prevFilters) => ({
      ...prevFilters,
      category: value,
    }));
  };

  const handleAvailabilityChange = (event) => {
    event.persist();

    let value = null;

    if (event.target.value !== 'all') {
      value = event.target.value;
    }

    setFilters((prevFilters) => ({
      ...prevFilters,
      availability: value,
    }));
  };

  const handleStockChange = (event) => {
    event.persist();

    let value = null;

    if (event.target.checked) {
      value = true;
    }

    setFilters((prevFilters) => ({
      ...prevFilters,
      inStock: value,
    }));
  };

  const handleShippableChange = (event) => {
    event.persist();

    let value = null;

    if (event.target.checked) {
      value = true;
    }

    setFilters((prevFilters) => ({
      ...prevFilters,
      isShippable: value,
    }));
  };

  const handleSortChange = (event) => {
    event.persist();
    setSort(event.target.value);
  };

  const handleSelectAllProducts = (event) => {
    setSelectedProducts(event.target.checked
      ? products.map((product) => product.id)
      : []);
  };

  const handleSelectOneProduct = (event, productId) => {
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts((prevSelected) => [...prevSelected, productId]);
    } else {
      setSelectedProducts((prevSelected) => prevSelected.filter((id) => id !== productId));
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value));
  };

  // Usually query is done on backend with indexing solutions
  const filteredProducts = applyFilters(products, query, filters);
  const paginatedProducts = applyPagination(filteredProducts, page, limit);
  const enableBulkOperations = selectedProducts.length > 0;
  const selectedSomeProducts = selectedProducts.length > 0 && selectedProducts.length < products.length;
  const selectedAllProducts = selectedProducts.length === products.length;

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Box p={2}>
        <Box
          alignItems="center"
          display="flex"
        >
          <TextField
            className={classes.queryField}
            InputProps={
              {
                startAdornment: (
                  <InputAdornment position="start">
                    <SvgIcon
                      color="action"
                      fontSize="small"
                    >
                      <SearchIcon />
                    </SvgIcon>
                  </InputAdornment>
                ),
              }
            }
            onChange={handleQueryChange}
            placeholder="Search products"
            value={query}
            variant="outlined"
          />
          <Box flexGrow={1} />
          <TextField
            label="Sort By"
            name="sort"
            onChange={handleSortChange}
            select
            SelectProps={{ native: true }}
            value={sort}
            variant="outlined"
          >
            {
              sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))
            }
          </TextField>
        </Box>
        <Box
          alignItems="center"
          display="flex"
          mt={3}
        >
          <TextField
            className={classes.categoryField}
            label="Category"
            name="category"
            onChange={handleCategoryChange}
            select
            SelectProps={{ native: true }}
            value={filters.category || 'all'}
            variant="outlined"
          >
            {
              categoryOptions.map((categoryOption) => (
                <option
                  key={categoryOption.id}
                  value={categoryOption.id}
                >
                  {categoryOption.name}
                </option>
              ))
            }
          </TextField>
          <TextField
            className={classes.availabilityField}
            label="Availability"
            name="availability"
            onChange={handleAvailabilityChange}
            select
            SelectProps={{ native: true }}
            value={filters.availability || 'all'}
            variant="outlined"
          >
            {
              avalabilityOptions.map((avalabilityOption) => (
                <option
                  key={avalabilityOption.id}
                  value={avalabilityOption.id}
                >
                  {avalabilityOption.name}
                </option>
              ))
            }
          </TextField>
          <FormControlLabel
            className={classes.stockField}
            control={
              (
                <Checkbox
                  checked={!!filters.inStock}
                  name="inStock"
                  onChange={handleStockChange}
                />
              )
            }
            label="In Stock"
          />
          <FormControlLabel
            className={classes.shippableField}
            control={
              (
                <Checkbox
                  checked={!!filters.isShippable}
                  name="Shippable"
                  onChange={handleShippableChange}
                />
              )
            }
            label="Shippable"
          />
        </Box>
      </Box>
      {
        enableBulkOperations && (
          <div className={classes.bulkOperations}>
            <div className={classes.bulkActions}>
              <Checkbox
                checked={selectedAllProducts}
                indeterminate={selectedSomeProducts}
                onChange={handleSelectAllProducts}
              />
              <Button
                className={classes.bulkAction}
                variant="outlined"
              >
              Delete
              </Button>
              <Button
                className={classes.bulkAction}
                variant="outlined"
              >
              Edit
              </Button>
            </div>
          </div>
        )
      }
      <PerfectScrollbar>
        <Box minWidth={1200}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedAllProducts}
                    indeterminate={selectedSomeProducts}
                    onChange={handleSelectAllProducts}
                  />
                </TableCell>
                <TableCell />
                <TableCell>
                  Name
                </TableCell>
                <TableCell>
                  Inventory
                </TableCell>
                <TableCell>
                  Details
                </TableCell>
                <TableCell>
                  Attributes
                </TableCell>
                <TableCell>
                  Price
                </TableCell>
                <TableCell align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                paginatedProducts.map((product) => {
                  const isProductSelected = selectedProducts.includes(product.id);

                  return (
                    <TableRow
                      hover
                      key={product.id}
                      selected={isProductSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isProductSelected}
                          onChange={(event) => handleSelectOneProduct(event, product.id)}
                          value={isProductSelected}
                        />
                      </TableCell>
                      <TableCell className={classes.imageCell}>
                        {
                          product.image ? (
                            <img
                              alt="Product"
                              className={classes.image}
                              src={product.image}
                            />
                          ) : (
                            <Box
                              bgcolor="background.dark"
                              p={2}
                            >
                              <SvgIcon>
                                <ImageIcon />
                              </SvgIcon>
                            </Box>
                          )
                        }
                      </TableCell>
                      <TableCell>
                        <Link
                          color="textPrimary"
                          component={RouterLink}
                          to="#"
                          underline="none"
                          variant="subtitle2"
                        >
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {getInventoryLabel(product.inventoryType)}
                      </TableCell>
                      <TableCell>
                        {product.quantity}
                        {' '}
                      in stock
                        {product.variants > 1 && ` in ${product.variants} variants`}
                      </TableCell>
                      <TableCell>
                        {product.attributes.map((attr) => attr)}
                      </TableCell>
                      <TableCell>
                        {numeral(product.price).format(`${product.currency}0,0.00`)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton>
                          <SvgIcon fontSize="small">
                            <EditIcon />
                          </SvgIcon>
                        </IconButton>
                        <IconButton>
                          <SvgIcon fontSize="small">
                            <ArrowRightIcon />
                          </SvgIcon>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              }
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredProducts.length}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handleLimitChange}
            page={page}
            rowsPerPage={limit}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Box>
      </PerfectScrollbar>
    </Card>
  );
};

Results.propTypes = {
  className: PropTypes.string,
  products: PropTypes.array.isRequired,
};

Results.defaultProps = {
  products: [],
};

export default Results;
