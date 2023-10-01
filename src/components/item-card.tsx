import { mdiPackage } from '@mdi/js';
import Icon from '@mdi/react';
import { Button, Card, CardActions, CardContent, CardHeader, Typography } from '@mui/material';
import React from 'react';
import ItemCardProps from '../interfaces/components/item-card-props';

const ItemCard: React.FC<ItemCardProps> = (props) => {
  const openDialog = (sell: boolean) => {
    props.setIsDialogVisible(true);
    props.setStock(props.stock);
    props.setSell(sell);
  };

  return (
    <Card sx={{ padding: '1rem', margin: '1rem', borderRadius: '0.5rem' }}>
      <CardHeader
        icon={<Icon path={mdiPackage} size={1.5} />}
        title={props.stock.first.name}
        subtitle={`${props.stock.first.weight}, ${props.stock.first.model}`}
      />
      <CardContent>
        <Typography variant="body1">Sisa barang: {props.stock.second}</Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={() => openDialog(false)}>
          Beli
        </Button>
        <Button
          variant="contained"
          onClick={() => openDialog(true)}
          disabled={props.stock.second <= 0}
        >
          Jual
        </Button>
      </CardActions>
    </Card>
  );
};

export default ItemCard;
