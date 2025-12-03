

import React, { useContext } from 'react';
import { Box, Typography, Divider, Grid, Dialog, DialogContent, Button, Chip, Paper, Table, TableCell, TableHead, TableBody, TableRow } from '@mui/material';
import { LoginContext } from '../Contextprovider/Context';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import { useState, useEffect } from 'react';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import UpdateOrganizer from '../pages/UpdateOrganizer';
import { toast, ToastContainer } from 'react-toastify';
import PrintIcon from '@mui/icons-material/Print';
import { useNavigate  } from 'react-router-dom';


const Active = () => {
  const [accountId, setAccountId] = useState('')
  const { logindata } = useContext(LoginContext);
  console.log(logindata)
  const LOGIN_API = process.env.REACT_APP_USER_LOGIN;
  const ORGANIZER_API = process.env.REACT_APP_ORGANIZER_TEMP_URL;
  const fetchAccountId = async () => {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };

    fetch(`http://127.0.0.1:7000/accounts/accountdetails/accountdetailslist/listbyuserid/${logindata.user.id}`, requestOptions)
      .then((response) => response.json()
      )
      .then((result) => {
        console.log(result)
        setAccountId(result.accounts[0]._id)
        console.log(result.accounts[0]._id)
      })
      .catch((error) => console.error(error));
  };

  console.log(accountId)

  useEffect(() => {
    fetchAccountId()

  }, []);





  const [organizerTemplatesData, setOrganizerTemplatesData] = useState([]);
  const [issubmitted,setIssubmitted]=useState();

  const [isActiveTrue, setIsActiveTrue] = useState(true);

  const fetchOrganizerTemplates = async (accountId) => {
    try {

      const url = `${ORGANIZER_API}/workflow/orgaccwise/organizeraccountwise/organizerbyaccount/accid/${accountId}/${isActiveTrue}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch organizerTemplatesData");
      }
  
      const data = await response.json();
      console.log("tempdata:", data);
  
      // Assuming you want to handle multiple organizerAccountWise items
      if (data.organizerAccountWise && data.organizerAccountWise.length > 0) {
        setOrganizerTemplatesData(data.organizerAccountWise);
  
        // Log all issubmited statuses
        data.organizerAccountWise.forEach((organizer) => {
          console.log("status:", organizer.issubmited);
        });
  
        // Optionally, set issubmitted for the first organizer or aggregate
        setIssubmitted('status',data.organizerAccountWise[0].issubmited);
      } else {
        console.warn("No organizerAccountWise data available");
      }
    } catch (error) {
      console.error("Error fetching organizerTemplatesData:", error);
    }
  };
  
  // const fetchOrganizerTemplates = async (accountId) => {
  //   try {
  //     const url = `${ORGANIZER_API}/workflow/orgaccwise/organizeraccountwise/organizerbyaccount/${accountId}`;

  //     const response = await fetch(url);
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch organizerTemplatesData");
  //     }
  //     const data = await response.json();
  //     console.log('tempdata',data);
  //     setOrganizerTemplatesData(data.organizerAccountWise);
  //     setIssubmitted(data.issubmited);
  //     console.log("stetus:",data.issubmited)
  //     // console.log(data.organizerAccountWise[0].organizertemplateid.organizerName)
  //     // console.log(data.organizerAccountWise[0].issealed)
  //     // console.log(data.organizerAccountWise[0]._id)
  //   } catch (error) {
  //     console.error("Error fetching organizerTemplatesData:", error);
  //   }
  // };
  useEffect(() => {
    fetchOrganizerTemplates(accountId);
  }, [accountId]);

  ///
  const [selectedOrganizer, SetSelectedOrganizer] = useState({});
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);



  const navigate = useNavigate();


  const handleEdit = (_id) => {

    SetSelectedOrganizer(_id);
    console.log(_id)
  //  setPreviewDialogOpen(true);
  navigate(`/organizers/update/${_id}`);
    
  };
  console.log(selectedOrganizer)
  const handleClosePreview = () => {
    setPreviewDialogOpen(false); 
  };

  const handleSealedEdit = (organizerName) => {
    if (typeof organizerName === 'object') {
      console.error('Organizer name is an object:', organizerName); 
      organizerName = organizerName.name || 'Unknown Organizer'; 
    }
    
    toast.info(`${organizerName} is sealed, cannot edit.`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      draggable: true,
      theme: "light",
    });
  };

  //for print 
const printOrganizerData = (id) => {
  const organizer = organizerTemplatesData.find((org) => org._id === id);
  console.log(organizer);
  if (!organizer) {
      console.log("Organizer not found");
      return;
  }

  // Open a new window for printing
  const printWindow = window.open('', '_blank');

  // Create the content to be printed
  let printContent = "<h1>Sections Data</h1>";

  // Iterate through sections and generate HTML content
  organizer.sections.forEach((section, index) => {
      printContent += `<h2>Section ${index + 1}: ${section.name}</h2>`;
      printContent += `<p><strong>ID:</strong> ${section.id}</p>`;
      printContent += `<p><strong>Text:</strong> ${section.text}</p>`;
      
      // Iterate through form elements in the section
      section.formElements.forEach((element, elementIndex) => {
          printContent += `<h3>Form Element ${elementIndex + 1}</h3>`;
          printContent += `<p><strong>Type:</strong> ${element.type}</p>`;
          printContent += `<p><strong>Text:</strong> ${element.text}</p>`;
          printContent += `<p><strong>Text Value:</strong> ${element.textvalue || ''}</p>`;
          
          // If the element has options, print them
          if (element.options && element.options.length > 0) {
              printContent += `<p><strong>Options:</strong></p><ul>`;
              element.options.forEach((option, optionIndex) => {
                  printContent += `<li>Option ${optionIndex + 1}: ${option.text} (Selected: ${option.selected})</li>`;
              });
              printContent += `</ul>`;
          }
      });
  });

  // Write the content to the new window and trigger the print
  printWindow.document.write('<html><head><title>Print</title></head><body>');
  printWindow.document.write(printContent);
  printWindow.document.write('</body></html>');
  printWindow.document.close();

  // Trigger the print dialog
  printWindow.print();
};
  

  return (
    <Box>
      <Grid container justifyContent="center" alignItems="center" sx={{ mt: 2 }} className='cbilling-cards'>
        <Grid item xs={12} sm={6} md={5} display="flex" justifyContent="center">
          <Box sx={{ border: '2px dotted #94a3b8', width: '60%', minHeight: '148px', maxHeight: '148px' }} className='card1'>

            <Box sx={{ display: 'flex', gap: '10px', mt: 2, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Box sx={{ display: 'flex', gap: '10px', mt: 2, alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <PaymentsRoundedIcon sx={{ fontSize: '70px' }} />
                  <MonetizationOnRoundedIcon sx={{ position: 'absolute', top: 0, left: 0, fontSize: '24px', backgroundColor: '#fff', borderRadius: '50%', color: '#24c875' }} />
                </Box>
                <Typography sx={{ color: '#697991' }} variant="h7">outstanding balance</Typography>
              </Box>

            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: "#1976d3" }}>
              <Typography sx={{ fontSize: '30px' }} variant='h6'>$0.00</Typography>
            </Box>


          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={5} display="flex" justifyContent="center">
          <Box sx={{ border: '2px dotted #94a3b8', width: '60%', minHeight: '148px', maxHeight: '148px' }} className='card1'>

            <Box sx={{ display: 'flex', gap: '10px', mt: 2, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Box sx={{ display: 'flex', gap: '10px', mt: 2, alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <PaymentsRoundedIcon sx={{ fontSize: '70px' }} />
                  <StarsRoundedIcon sx={{ position: 'absolute', top: 0, left: 0, fontSize: '24px', backgroundColor: '#fff', borderRadius: '50%', color: '#24c875' }} />
                </Box>
                <Typography sx={{ color: '#697991' }} variant="h7">Credits Available</Typography>
              </Box>

            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: "#24c875" }}>
              <Typography sx={{ fontSize: '30px' }} variant='h6'>$0.00</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ mt: 2 }} />
      <Box>


      </Box>
      <Dialog open={previewDialogOpen} onClose={handleClosePreview} fullScreen>
        <DialogContent>
          <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "2px solid #3FA2F6",
                  p: 2,
                  mb: 3,
                  borderRadius: "10px",
                  backgroundColor: "#96C9F4",
                }}
              >
                <Box>
                  <Typography fontWeight="bold">Organizer View</Typography>
                  <Typography>The client sees your organizer like this</Typography>
                </Box>
                <Button variant="text" onClick={handleClosePreview}>
                  Back to edit
                </Button>
              </Box>

              {/* Make sure that selectedOrganizer is not undefined or null */}
              <UpdateOrganizer OrganizerData={selectedOrganizer} onClose={handleClosePreview} />
            </LocalizationProvider>
          </Box>
        </DialogContent>
      </Dialog>



      

      <Paper>
        <Table sx={{ minWidth: 650,height:'40vh ',overflowY:'auto'}} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Last Updated</strong>
              </TableCell>
              <TableCell>
                <strong>Seal</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>

              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizerTemplatesData.map((row) => (
              <TableRow key={row._id}>
                <TableCell>
                  {row.issealed ? (
                    <Typography sx={{ color: "#2c59fa", fontWeight: "bold" }} onClick={() => handleSealedEdit(row.organizertemplateid.organizerName)}>
                      {row.organizertemplateid.organizerName}
                    </Typography>
                  ) : (
                    <Typography sx={{ color: "#2c59fa", cursor: "pointer", fontWeight: "bold" }} onClick={() => handleEdit(row._id)}>
                      {row.organizertemplateid.organizerName}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(row.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </TableCell>
                <TableCell>{row.issealed ? <Chip label="Sealed" color="primary" /> : null}</TableCell>
                <TableCell>
                  <Chip
                    label={row.issubmited ? "Completed" : "Pending"}
                    color={row.issubmited ? "success" : "default"}
                    sx={{
                      backgroundColor: row.issubmited ? "green" : "grey",
                      color: "white",
                    }}
                  />
                </TableCell>

          <TableCell>
            <PrintIcon onClick={() => printOrganizerData(row._id)} sx={{color:'#1976d3',cursor:'pointer'}}/>
          </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>


      <ToastContainer />
    </Box>
  )
}

export default Active
