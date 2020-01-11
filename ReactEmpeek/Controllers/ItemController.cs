using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReactEmpeek.Models;
using Remotion.Linq.Clauses;

namespace ReactEmpeek.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        private readonly ItemContext itemContext = new ItemContext();

        [HttpGet("[action]")]
        public ItemViewModel GetItems([FromQuery]int page = 1)
        {
            int pageSize = 4; // количество объектов на страницу
            IEnumerable<Item> itemsPerPages = itemContext.Items.Skip((page - 1) * pageSize).Take(pageSize);
            PageInfo pageInfo = new PageInfo { PageNumber = page, PageSize = pageSize, TotalItems = itemContext.Items.ToList().Count};
            ItemViewModel ivm = new ItemViewModel() { PageInfo = pageInfo, Items = itemsPerPages };
            return ivm;
        }

        [HttpGet("[action]")]
        public PageInfo getPageInfo()
        {
            var info = new PageInfo() { PageSize = 4, TotalItems = itemContext.Set<Item>().ToList().Count };
            var size = info.TotalPages;
            return info;
        }

        [HttpGet("[action]")]
        public ItemStatisticViewModel GetItemStatistic([FromQuery]int page = 1)
        {
            var groupedItems = (from items in itemContext.Items
                group items by items.Type
                into groupedItem
                select new ItemStatistic {Type = groupedItem.Key, Count = groupedItem.Count()}).AsEnumerable();
            int pageSize = 3;
            IEnumerable<ItemStatistic> itemsPerPages = groupedItems.Skip((page - 1) * pageSize).Take(pageSize);
            PageInfo pageInfo = new PageInfo { PageNumber = page, PageSize = pageSize, TotalItems = itemContext.Items.Count() };
            ItemStatisticViewModel ivm = new ItemStatisticViewModel() {ItemStatistic = itemsPerPages, PageInfo = pageInfo};
            return ivm;
        }

        [HttpDelete("[action]")]
        public async Task DeleteItem([FromBody]Id id)
        {
            var item = await itemContext.Set<Item>().FindAsync(id.ID);
            itemContext.Items.Remove(item);
            itemContext.SaveChanges();
        }
        [HttpPost("[action]")]
        public void AddPoint([FromBody]AddItemCommand request)
        {
            itemContext.Set<Item>().Add(new Item(request.Name,request.Type));
            itemContext.SaveChanges();
        }
        [HttpPut("[action]")]
        public void UpdateItem([FromBody]Item item)
        {
            itemContext.Items.Update(item);
            itemContext.SaveChanges();
        }

    }
}