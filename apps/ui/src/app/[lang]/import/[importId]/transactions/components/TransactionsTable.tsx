'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { CsvImportResponse, Category } from 'schemas';

interface TransactionsTableProps {
  rows: CsvImportResponse[];
  categories: Category[];
  selectedRows: string[];
  onSelectRows: (ids: string[]) => void;
  rowCategories: Record<string, string>;
  onChangeCategory: (rowId: string, categoryId: string) => void;
}

export default function TransactionsTable({
  rows,
  categories,
  selectedRows,
  onSelectRows,
  rowCategories,
  onChangeCategory,
}: TransactionsTableProps) {
  const allSelected = rows.length > 0 && selectedRows.length === rows.length;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelectRows(event.target.checked ? rows.map((r) => r.id) : []);
  };

  const handleSelectRow = (id: string) => {
    onSelectRows(
      selectedRows.includes(id)
        ? selectedRows.filter((rid) => rid !== id)
        : [...selectedRows, id],
    );
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox checked={allSelected} onChange={handleSelectAll} />
            </TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Category</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedRows.includes(row.id)}
                  onChange={() => handleSelectRow(row.id)}
                />
              </TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>{row.amount}</TableCell>
              <TableCell sx={{ width: 300, minWidth: 300, maxWidth: 300 }}>
                <FormControl size="small" fullWidth>
                  <Select
                    value={rowCategories[row.id] ?? ''}
                    onChange={(e) => onChangeCategory(row.id, e.target.value)}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
