# seed.py
from app.database import SessionLocal, engine, Base
from app import models


def seed_data():
    db = SessionLocal()

    # Create table if not exists 
    Base.metadata.create_all(bind=engine)

    # Clear existing data (optional - careful in production)
    print("🧹 Clearing existing data...")
    db.query(models.OrderItem).delete()
    db.query(models.Order).delete()
    db.query(models.MenuItem).delete()
    db.query(models.Cafeteria).delete()
    db.query(models.User).delete()
    db.commit()

    # Create Sample Cafeterias
    print("🏪 Creating cafeterias...")

    caf1 = models.Cafeteria(
        name="B.T.O Cafeteria",
        location="Beside Faculty of Science",
        is_open=True,
        max_orders_per_slot=30
    )
    caf2 = models.Cafeteria(
        name="DUNN-KAYCE Cafeteria",
        location="In Front Of Boys Hostel 2",
        is_open=True,
        max_orders_per_slot=25
    )
    caf3 = models.Cafeteria(
        name="Laughter's Kitchen Cafeteria",
        location="Near Faculty of Science",
        is_open=True,
        max_orders_per_slot=20
    )

    db.add_all([caf1, caf2, caf3])
    db.commit()
    db.refresh(caf1)
    db.refresh(caf2)
    db.refresh(caf3)

    # Create Menu Items
    print("🍛 Creating menu items...")

    menu_items = [
        # B.T.O Cafeteria
        models.MenuItem(name="Jollof Rice", price=300, description="Jellof rice", cafeteria_id=caf1.id),
        models.MenuItem(name="Fried Rice", price=300, description="Fried rice", cafeteria_id=caf1.id),
        models.MenuItem(name="White Rice", price=300, description="White rice", cafeteria_id=caf1.id),
        models.MenuItem(name="Porridge Beans", price=400, description="Porridge Beans", cafeteria_id=caf1.id),
        models.MenuItem(name="White Beans", price=400, description="White Beans", cafeteria_id=caf1.id),
        models.MenuItem(name="Bottle Water", price=200, description="500ml", cafeteria_id=caf1.id),
        
        # DUNN-KAYCE Cafeteria
        models.MenuItem(name="Pounded Yam", price=600, description="Pounded Yam with any soup", cafeteria_id=caf2.id),
        models.MenuItem(name="Eba", price=500, description="Eba with any soup", cafeteria_id=caf2.id),
        models.MenuItem(name="Semo", price=500, description="Semo with any soup", cafeteria_id=caf2.id),
        models.MenuItem(name="Porridge Beans", price=450, description="Porridge Beans", cafeteria_id=caf2.id),
        models.MenuItem(name="White Beans", price=450, description="White Beans", cafeteria_id=caf2.id),
        models.MenuItem(name="White Rice", price=400, description="White Rice", cafeteria_id=caf2.id),
        models.MenuItem(name="Jellof Rice", price=400, description="Jellof Rice", cafeteria_id=caf2.id),
        models.MenuItem(name="Fride Rice", price=400, description="Fried Rice", cafeteria_id=caf2.id),
        models.MenuItem(name="Sausage", price=300, description="Sausage protine", cafeteria_id=caf2.id),
        models.MenuItem(name="Egg", price=300, description="Egg Protine", cafeteria_id=caf2.id),
        models.MenuItem(name="Beef", price=600, description="Beef Protine", cafeteria_id=caf2.id),
        models.MenuItem(name="Small Chicken", price=1000, description="Small Chicken Protine", cafeteria_id=caf2.id),
        models.MenuItem(name="Turkey", price=1200, description="Turkey Protine", cafeteria_id=caf2.id),
        models.MenuItem(name="Fish", price=700, description="Fish Protine", cafeteria_id=caf2.id),
        models.MenuItem(name="Bottle Water", price=200, description="500ml", cafeteria_id=caf2.id),

        

        # Laughter's Kitchen Cafeteria
        models.MenuItem(name="White Rice", price=300, description="White Rice", cafeteria_id=caf3.id),
        models.MenuItem(name="Jellof Rice", price=300, description="Jellof Rice", cafeteria_id=caf3.id),
        models.MenuItem(name="Coke", price=500, description="50cl", cafeteria_id=caf3.id),
        models.MenuItem(name="Fride Rice", price=300, description="Fried Rice", cafeteria_id=caf3.id),
        models.MenuItem(name="Bottle Water", price=200, description="500ml", cafeteria_id=caf3.id),
    ]

    db.add_all(menu_items)
    db.commit()

    # Create Vendor Users linked to cafeterias
    print("👨‍💼 Creating vendor users...")
    from app.utils.security import get_password_hash
    
    vendor1 = models.User(
        email="vendor@bto.com",
        full_name="B.T.O Manager",
        hashed_password=get_password_hash("password123"),
        role=models.UserRole.VENDOR,
        cafeteria_id=caf1.id
    )
    vendor2 = models.User(
        email="vendor@dunkayce.com",
        full_name="DUNN-KAYCE Manager",
        hashed_password=get_password_hash("password123"),
        role=models.UserRole.VENDOR,
        cafeteria_id=caf2.id
    )
    vendor3 = models.User(
        email="vendor@laughters.com",
        full_name="Laughter's Kitchen Manager",
        hashed_password=get_password_hash("password123"),
        role=models.UserRole.VENDOR,
        cafeteria_id=caf3.id
    )
    
    db.add_all([vendor1, vendor2, vendor3])
    db.commit()

    print("✅ Seeding completed successfully!")
    print(f"Created {len([caf1, caf2, caf3])} cafeterias with menu items.")
    
    db.close()

if __name__ == "__main__":
    seed_data()