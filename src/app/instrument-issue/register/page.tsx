'use client';

import { useEffect, useState } from 'react';
import { useInstrumentStore, usePayrollStore, useUserStore } from '../../../../store/store';
import { deleteInstrumentData } from '@/lib/deleteData';
import { Button } from '@mui/joy';
import { CirclePlus, Trash2, Undo2 } from 'lucide-react';
import { Refresh } from '@mui/icons-material';
import InstrumentTable from './instrumentTable';
import ScanPayroll from './scanPayroll';
import InstrumentForm from './instrumentForm';
import ReturnForm from './returnForm';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

export default function Page() {
  const [openInstrument, setOpenInstrument] = useState(false);
  const [refetch, setRefetch] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const { selectedId, resetSelectedId } = useInstrumentStore();
  const userLevel = useUserStore((state) => state.userLevel);
  const { openPayroll, setOpenPayroll, fromReturnForm, setFromReturnForm } = usePayrollStore();

  const [payrollId, setPayrollId] = useState('');
  const [payrollName, setPayrollName] = useState('');

  useEffect(() => {
    const id = sessionStorage.getItem('payroll_id');
    const name = sessionStorage.getItem('payroll_name');
    setPayrollId(id ?? '');
    setPayrollName(name ?? '');

    if (!id || !name) return;

    if (fromReturnForm) {
      setOpenPayroll(false);
      setOpenInstrument(false);
    } else {
      setOpenInstrument(true);
    }
  }, []);

  const handleDeleteInstrument = () => {
    if (selectedId) {
      deleteInstrumentData(selectedId);
      setRefetch((prev) => !prev);
      resetSelectedId();
    }
    setOpenDeleteDialog(false);
  };

  return (
    <div className="p-4 shadow-md rounded-xl">
      <div className="flex flex-row gap-4">
        <Button
          startDecorator={<CirclePlus />}
          onClick={() => {
            usePayrollStore.getState().setFromReturnForm(false);
            usePayrollStore.getState().setOpenPayroll(true);
          }}
          color="success"
          sx={{ paddingY: 1.2 }}
          disabled={selectedId != null || userLevel !== 'Admin'}
        >
          Tambah
        </Button>

        {selectedId != null && (
          <>
            <Button
              startDecorator={<Trash2 />}
              onClick={() => setOpenDeleteDialog(true)}
              color="danger"
              sx={{ paddingY: 1.2 }}
            >
              Hapus
            </Button>
            <Button
              startDecorator={<Undo2 />}
              onClick={() => {
                setOpenPayroll(true);
                setFromReturnForm(true);
              }}
              color="danger"
              sx={{ paddingY: 1.2 }}
            >
              Return
            </Button>
          </>
        )}
        <Button
          startDecorator={<Refresh />}
          color="primary"
          onClick={() => setRefetch((prev) => !prev)}
          sx={{ paddingY: 1.2 }}
        >
          Refresh
        </Button>
      </div>

      <InstrumentTable reload={refetch} />

      <ScanPayroll
        open={openPayroll}
        close={() => setOpenPayroll(false)}
        onSuccess={() => {
          if (fromReturnForm) {
            setOpenPayroll(false);
            setOpenReturn(true);
          } else {
            setOpenInstrument(true);
          }
        }}
      />

      <InstrumentForm
        open={openInstrument}
        close={() => {
          sessionStorage.clear();
          setOpenInstrument(false);
        }}
        onSuccess={() => setRefetch((prev) => !prev)}
      />

      <ReturnForm
        open={openReturn}
        close={() => {
          sessionStorage.clear();
          setOpenReturn(false);
        }}
        onSuccess={() => setRefetch((prev) => !prev)}
      />

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Hapus Data</DialogTitle>
        <DialogContent>
          <p>Apakah anda yakin ingin menghapus data ini?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Tidak</Button>
          <Button color="danger" onClick={handleDeleteInstrument}>
            Ya
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
